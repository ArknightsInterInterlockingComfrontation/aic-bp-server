import express, { Request, Response, NextFunction, Router } from "express";
import { changeStates, competition, mirroCompetition, resetTeamData, stopCompetitionTimer } from "../../../modules/competition";
import { UUIDGenerator } from "../../../utils/genarator";
import { updateClient, updateTurn } from "../../../modules/socket";
import dayjs from "dayjs";

export const router: Router = express.Router();

router.all("*", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  next();
});

router.get("/GetCompetitionId", function (req, res) {
  if (req.query.cid === competition.competitionId.commentary) {
    res.send({
      blueTeamCompetitionId: competition.competitionId.blue,
      redTeamCompetitionId: competition.competitionId.red,
    });
  } else {
    res.send("err");
  }
});

router.get("/GetCompetitionStates", function (req, res) {
  res.send(competition.states);
});

function setCustomCompetitionData(customData: string) {
  const data = JSON.parse(customData);
  const { turn, teamData, extraBans } = data;

  if (turn) {
    competition.turn = turn;
  }

  if (teamData) {
    const { blueTeam, redTeam } = teamData;
    if (blueTeam) {
      if (blueTeam.ban) competition.teamData.blueTeam.ban = blueTeam.ban;
      if (blueTeam.pick) competition.teamData.blueTeam.pick = blueTeam.pick;
    }

    if (redTeam) {
      if (redTeam.ban) competition.teamData.redTeam.ban = redTeam.ban;
      if (redTeam.pick) competition.teamData.redTeam.pick = redTeam.pick;
    }
  }

  if (extraBans) {
    competition.extraBans = extraBans;
  }
}

router.post("/SetCompetitionPauseState", function (req, res) {
  const { pausing } = req.body;

  competition.pausing = pausing as boolean;
  updateTurn();
  if (competition.pausing) {
    stopCompetitionTimer();
  }

  let replay = {
    order: competition.replay.length + 1,
    timeline: dayjs().diff(competition.startedTime),
    team: "commentary",
    action: "pause",
    value: competition.pausing,
    turn: competition.turn,
  };

  competition.replay.push(replay);

  res.send({
    status: "ok",
  });
});

router.post("/GenerateCompetition", function (req, res) {
  const { blueTeamPlayers, redTeamPlayers, first, customData } = req.body;

  competition.turn = -1;
  competition.replay = [];
  competition.teamData = resetTeamData();
  competition.teamData.blueTeam.players = blueTeamPlayers;
  competition.teamData.redTeam.players = redTeamPlayers;
  competition.competitionId.blue = UUIDGenerator();
  competition.competitionId.red = UUIDGenerator();
  competition.extraBans = [];

  if (customData) {
    setCustomCompetitionData(customData);
  }
  competition.playing = false;
  competition.pausing = false;
  changeStates(first);
  updateClient();

  stopCompetitionTimer();

  mirroCompetition.value = JSON.parse(JSON.stringify(competition))


  res.send({
    blueTeamCompetitionId: competition.competitionId.blue,
    redTeamCompetitionId: competition.competitionId.red,
  });
});

router.get("/StartCompetition", function (req, res) {
  const { cid } = req.query;
  if (cid === competition.competitionId.commentary) {
    if (competition.turn === -1) {
      competition.turn = 0;
    }
    competition.startedTime = dayjs();
    competition.playing = true;
    let replay = {
      order: competition.replay.length + 1,
      timeline: 0,
      team: "commentary",
      action: "start",
      value: "start",
      turn: competition.turn,
    };
    competition.replay.push(replay);

    updateTurn();
  }
  res.send({
    blueTeamCompetitionId: competition.competitionId.blue,
    redTeamCompetitionId: competition.competitionId.red,
  });
});
