module Wasp.Cli.Command.Compile
  ( compileIO,
    compile,
    compileWithOptions,
    compileIOWithOptions,
    defaultCompileOptions,
  )
where

import Control.Monad.Except (throwError)
import Control.Monad.IO.Class (liftIO)
import Data.List (intercalate)
import StrongPath (Abs, Dir, Path', (</>))
import Wasp.Cli.Command (Command, CommandError (..))
import Wasp.Cli.Command.Common
  ( findWaspProjectRootDirFromCwd,
  )
import Wasp.Cli.Command.Message (cliSendMessageC)
import qualified Wasp.Cli.Common as Common
import Wasp.Cli.Message (cliSendMessage)
import Wasp.Common (WaspProjectDir)
import Wasp.CompileOptions (CompileOptions (..))
import qualified Wasp.Lib
import qualified Wasp.Message as Msg

compile :: Command ()
compile = do
  -- TODO: Consider a way to remove the redundancy of finding the project root
  -- here and in compileWithOptions. One option could be to add this to defaultCompileOptions
  -- add make externalCodeDirPath a helper function, along with any others we typically need.
  waspProjectDir <- findWaspProjectRootDirFromCwd
  compileWithOptions $ defaultCompileOptions waspProjectDir

compileWithOptions :: CompileOptions -> Command ()
compileWithOptions options = do
  waspProjectDir <- findWaspProjectRootDirFromCwd
  let outDir =
        waspProjectDir </> Common.dotWaspDirInWaspProjectDir
          </> Common.generatedCodeDirInDotWaspDir

  cliSendMessageC $ Msg.Start "Compiling wasp code..."
  compilationResult <- liftIO $ compileIOWithOptions options waspProjectDir outDir
  case compilationResult of
    Left compileError -> throwError $ CommandError "Compilation failed" compileError
    Right () -> cliSendMessageC $ Msg.Success "Code has been successfully compiled, project has been generated."

-- | Compiles Wasp source code in waspProjectDir directory and generates a project
--   in given outDir directory.
compileIO ::
  Path' Abs (Dir WaspProjectDir) ->
  Path' Abs (Dir Wasp.Lib.ProjectRootDir) ->
  IO (Either String ())
compileIO waspProjectDir outDir = compileIOWithOptions (defaultCompileOptions waspProjectDir) waspProjectDir outDir

compileIOWithOptions ::
  CompileOptions ->
  Path' Abs (Dir Common.WaspProjectDir) ->
  Path' Abs (Dir Wasp.Lib.ProjectRootDir) ->
  IO (Either String ())
compileIOWithOptions options waspProjectDir outDir = do
  (compilerWarnings, compilerErrors) <- Wasp.Lib.compile waspProjectDir outDir options
  case compilerErrors of
    [] -> do
      displayWarnings compilerWarnings
      return $ Right ()
    errors -> return $ Left $ formatMessages errors
  where
    formatMessages messages = intercalate "\n" $ map ("- " ++) messages
    displayWarnings [] = return ()
    displayWarnings warnings =
      cliSendMessage $ Msg.Warning "Your project compiled with warnings" (formatMessages warnings ++ "\n\n")

defaultCompileOptions :: Path' Abs (Dir WaspProjectDir) -> CompileOptions
defaultCompileOptions waspProjectDir =
  CompileOptions
    { externalCodeDirPath = waspProjectDir </> Common.extCodeDirInWaspProjectDir,
      isBuild = False,
      sendMessage = cliSendMessage,
      generatorWarningsFilter = id
    }
