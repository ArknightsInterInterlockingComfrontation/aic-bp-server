import { Server } from "socket.io";
import { server as httpServer } from "./express";
import chalk from "chalk";
import { checkCid, competition, saveCompetitionReplay, startCompetitionTimer } from "../modules/competition";
import dayjs from "dayjs";

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let gameTimestamp = 0;

io.on("connection", (socket) => {
  let ownCid = "";
  socket.emit("hello", {
    ID: socket.id,
  });
  console.log(`一名用户已进入,当前在线人数：${io.engine.clientsCount}`);

  socket.on("hello", function (data) {
    socket.emit("hello", {
      ID: socket.id,
    });
  });

  socket.on("SubmitTurn", function (data) {
    console.log(data);
    if (competition.pausing || !competition.playing) return;
    if (checkCid(ownCid) !== "未找到" && data.turn === competition.turn) {
      let lastState = competition.states[competition.states.length - 1];

      if (lastState.team === "blue" && competition.teamData.blueTeam.pick[9]) {
        return;
      }
      if (lastState.team === "red" && competition.teamData.redTeam.pick[9]) {
        return;
      }

      const state = competition.states[competition.turn];
      const { team, action } = state;
      if (checkCid(ownCid) !== team) return;
      const targetTeam = team === "blue" ? competition.teamData.blueTeam : competition.teamData.redTeam;

      if (action === "ban") {
        targetTeam.ban.push(data.preSelect);
      } else if (action === "pick") {
        targetTeam.pick.push(data.preSelect);
      }
      let replay = {
        order: competition.replay.length + 1,
        timeline: dayjs().diff(competition.startedTime),
        team: checkCid(ownCid),
        action: action,
        value: data.preSelect,
        turn: competition.turn,
      };

      competition.replay.push(replay);
      targetTeam.preSelect = "";
      if (competition.turn < competition.states.length - 1) {
        competition.turn++;
        //resetCompetitionTimer(io);
      }
      updateTurn();
      saveCompetitionReplay();
    }
  });

  socket.on("UpdatePreSelect", function (preSelect) {
    if (competition.pausing || !competition.playing) return;
    if (checkCid(ownCid) !== "未找到") {
      const targetTeam = checkCid(ownCid) === "blue" ? competition.teamData.blueTeam : competition.teamData.redTeam;
      targetTeam.preSelect = preSelect;

      let replay = {
        order: competition.replay.length + 1,
        timeline: dayjs().diff(competition.startedTime),
        team: checkCid(ownCid),
        action: "preSelect",
        value: preSelect,
        turn: competition.turn,
      };

      competition.replay.push(replay);
      io.sockets
        .to(competition.competitionId.blue)
        .to(competition.competitionId.red)
        .to(competition.competitionId.commentary)
        .emit("UpdatePreSelect", {
          team: checkCid(ownCid),
          preSelect: targetTeam.preSelect,
        });
    }
  });

  socket.on("CheckCid", function (cid) {
    let team = checkCid(cid);
    if (team !== "未找到") {
      ownCid = cid;
      socket.join(cid);
      socket.emit("NextTurn", {
        playing: competition.playing,
        pausing: competition.pausing,
        turn: competition.turn,
        teamData: competition.teamData,
        extraBans: competition.extraBans,
      });

      socket.emit("timer", gameTimestamp);
    }
    socket.emit("CheckCidResult", team);
  });

  socket.on("ping", (timestamp) => {
    socket.emit("pong", timestamp);
  });

  socket.on("disconnect", function () {
    console.log(`一名用户已离开,当前在线人数：${io.engine.clientsCount}`);
  });
});

export function updateClient(): void {
  io.sockets.emit("CheckCid");
}

export function updateTurn(): void {
  startCompetitionTimer(io);
  io.sockets.to(competition.competitionId.blue).to(competition.competitionId.red).to(competition.competitionId.commentary).emit("NextTurn", {
    playing: competition.playing,
    pausing: competition.pausing,
    turn: competition.turn,
    teamData: competition.teamData,
    extraBans: competition.extraBans,
  });
  gameTimestamp = Date.now();
  io.sockets.to(competition.competitionId.blue).to(competition.competitionId.red).to(competition.competitionId.commentary).emit("timer", gameTimestamp);
}

console.log(chalk.green("[Success]"), "Socket.IO 服务已启动");
