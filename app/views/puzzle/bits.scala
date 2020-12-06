package views
package html.puzzle

import play.api.i18n.Lang
import play.api.libs.json.{ JsArray, JsObject, JsString, Json }

import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._
import lila.i18n.{ JsDump, MessageKey }
import lila.puzzle.{ PuzzleDifficulty, PuzzleTheme }

object bits {

  private val dataLastmove = attr("data-lastmove")

  def daily(p: lila.puzzle.Puzzle, fen: chess.format.FEN, lastMove: String) =
    views.html.board.bits.mini(fen, p.color, lastMove)(span)

  def jsI18n(implicit lang: Lang) = i18nJsObject(i18nKeys)

  lazy val jsonThemes = PuzzleTheme.all
    .collect {
      case t if t != PuzzleTheme.any => t.key
    }
    .partition(PuzzleTheme.staticThemes.contains) match {
    case (static, dynamic) =>
      Json.obj(
        "dynamic" -> dynamic.map(_.value).sorted.mkString(" "),
        "static"  -> static.map(_.value).mkString(" ")
      )
  }

  private val i18nKeys: List[MessageKey] = {
    List(
      trans.puzzle.yourPuzzleRatingX,
      trans.puzzle.bestMove,
      trans.puzzle.keepGoing,
      trans.puzzle.notTheMove,
      trans.puzzle.trySomethingElse,
      trans.yourTurn,
      trans.puzzle.findTheBestMoveForBlack,
      trans.puzzle.findTheBestMoveForWhite,
      trans.viewTheSolution,
      trans.puzzle.puzzleSuccess,
      trans.puzzle.puzzleComplete,
      trans.puzzle.fromGameLink,
      trans.boardEditor,
      trans.continueFromHere,
      trans.playWithTheMachine,
      trans.playWithAFriend,
      trans.puzzle.didYouLikeThisPuzzle,
      trans.puzzle.voteToLoadNextOne,
      trans.puzzle.puzzleId,
      trans.puzzle.ratingX,
      trans.puzzle.playedXTimes,
      trans.puzzle.continueTraining,
      trans.puzzle.difficultyLevel,
      trans.puzzle.toTrackYourProgress,
      trans.signUp,
      trans.analysis,
      trans.rated,
      trans.casual,
      // ceval
      trans.depthX,
      trans.usingServerAnalysis,
      trans.loadingEngine,
      trans.cloudAnalysis,
      trans.goDeeper,
      trans.showThreat,
      trans.gameOver,
      trans.inLocalBrowser,
      trans.toggleLocalEvaluation
    ) ::: PuzzleTheme.all.map(_.name) :::
      PuzzleTheme.all.map(_.description) :::
      PuzzleDifficulty.all.map(_.name)
  }.map(_.key)
}
