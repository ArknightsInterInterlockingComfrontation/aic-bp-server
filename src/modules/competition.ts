import { clearTimeout } from "node:timers";
import blueTeamFirststates from "../assets/blue-team-first-states.json";
import redTeamFirststates from "../assets/red-team-first-states.json";
import { Server } from "socket.io";
import { updateTurn } from "./socket";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";

let replaysPath = path.join("./", "replays");
if (!fs.existsSync(replaysPath)) {
  fs.mkdirSync(replaysPath);
}

type TeamData = {
  name: string;
  players: { qq: string; name: string }[];
  ban: string[];
  pick: string[];
  preSelect: string;
};
type TeamName = "blueTeam" | "redTeam";
type CompetitionId = {
  blue: string;
  red: string;
  commentary: string;
};

export type States = {
  turn: number;
  target: string;
  action: string;
  team: string;
  order: number;
};

export type Replay = {
  order: number;
  timeline: number;
  team: string;
  action: string;
  value: string | boolean;
  turn: number;
};

interface Competition {
  turn: number;
  competitionId: CompetitionId;
  teamData: { [key in TeamName]: TeamData };
  first: string;
  states: States[];
  extraBans: string[];
  playing: boolean;
  pausing: boolean;
  replay: Replay[];
  startedTime: dayjs.Dayjs;
}

export const competition: Competition = {
  turn: -1,
  startedTime: dayjs(),
  playing: false,
  pausing: false,
  competitionId: {
    blue: "blue",
    red: "red",
    commentary: "commentary",
  },
  first: "blue",
  teamData: resetTeamData(),
  states: blueTeamFirststates as unknown as States[],
  extraBans: [],
  replay: [],
};

export const mirroCompetition = {
  value: JSON.parse(JSON.stringify(competition)),
};

export function deepCloneCompetition(): Competition {
  return JSON.parse(JSON.stringify(competition));
}

export function changeStates(first: "blue" | "red"): void {
  if (first === "blue") {
    competition.states = blueTeamFirststates as unknown as States[];
  } else if (first === "red") {
    competition.states = redTeamFirststates as unknown as States[];
  }
}

export function autoNextTurn(io: Server): void {
  if (competition.turn < 0 || !competition.playing) return;
  let lastState = competition.states[competition.states.length - 1];
  if (lastState.team === "blue" && competition.teamData.blueTeam.pick[9]) {
    return;
  }
  if (lastState.team === "red" && competition.teamData.redTeam.pick[9]) {
    return;
  }
  const state = competition.states[competition.turn];
  const { team, action } = state;
  const targetTeam = team === "blue" ? competition.teamData.blueTeam : competition.teamData.redTeam;

  if (action === "ban") {
    targetTeam.ban.push(targetTeam.preSelect === "" ? "无" : targetTeam.preSelect);
  } else if (action === "pick") {
    targetTeam.pick.push(targetTeam.preSelect === "" ? "无" : targetTeam.preSelect);
  }
  targetTeam.preSelect = "";
  if (competition.turn < competition.states.length - 1) {
    competition.turn++;
  }
  updateTurn();
  saveCompetitionReplay();
}

let competitionTimer: null | NodeJS.Timeout = null;

export function startCompetitionTimer(io: Server): void {
  stopCompetitionTimer();

  competitionTimer = setTimeout(() => {
    if (competitionTimer) {
      clearTimeout(competitionTimer);
      competitionTimer = null;
      autoNextTurn(io);
    }
  }, 120 * 1000);
}
export function stopCompetitionTimer(): void {
  if (competitionTimer) {
    clearTimeout(competitionTimer);
    competitionTimer = null;
  }
}

export function resetCompetitionTimer(io: Server): void {
  startCompetitionTimer(io);
}

export function resetTeamData(): { [key in TeamName]: TeamData } {
  return {
    blueTeam: {
      name: "",
      players: [
        {
          name: "",
          qq: "",
        },
        {
          name: "",
          qq: "",
        },
      ],
      ban: [],
      pick: [],
      preSelect: "",
    },
    redTeam: {
      name: "",
      players: [
        {
          name: "",
          qq: "",
        },
        {
          name: "",
          qq: "",
        },
      ],
      ban: [],
      pick: [],
      preSelect: "",
    },
  };
}

export function checkCid(cid: string): string {
  if (cid === competition.competitionId.blue) {
    return "blue";
  } else if (cid === competition.competitionId.red) {
    return "red";
  } else if (cid === competition.competitionId.commentary) {
    return "commentary";
  } else {
    return "未找到";
  }
}

export function saveCompetitionReplay(): void {
  let competitionNow = deepCloneCompetition()
  let outData = {
    ...mirroCompetition.value,
    replay: competition.replay,
    realData:{
      turn:competitionNow.turn,
      pausing:competitionNow.pausing,
      teamData:competitionNow.teamData,
      extraBans:competitionNow.extraBans,
    }
  };
  fs.writeFileSync(path.join(replaysPath, `replay_${competition.startedTime.valueOf()}.json`), JSON.stringify(outData));
}
