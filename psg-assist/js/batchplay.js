/*
 * photoshop 모듈(action.batchPlay, core.executeAsModal)에 대한 얇은 래퍼.
 * UXP/Photoshop 런타임 밖(예: 브라우저 미리보기)에서 require("photoshop")가
 * 없을 수 있으므로 방어적으로 처리한다.
 */

let photoshop = null;
try {
  // eslint-disable-next-line global-require
  photoshop = require("photoshop");
} catch (err) {
  photoshop = null;
}

function ensurePhotoshop() {
  if (!photoshop) {
    throw new Error("Photoshop UXP 런타임 안에서만 batchPlay를 실행할 수 있습니다.");
  }
  return photoshop;
}

/**
 * batchPlay 디스크립터 배열을 실행한다.
 * @param {object[]} commands - Action Manager 디스크립터 배열
 * @param {object} [options]
 */
async function runBatchPlay(commands, options = {}) {
  const ps = ensurePhotoshop();
  try {
    return await ps.action.batchPlay(commands, {
      synchronousExecution: false,
      modalBehavior: "execute",
      ...options
    });
  } catch (err) {
    console.error("[PSG Assist] batchPlay 실행 오류:", err);
    throw err;
  }
}

/**
 * Photoshop 문서를 변경하는 작업은 반드시 executeAsModal 안에서 실행해야 한다.
 * @param {string} commandName - Undo 히스토리에 표시될 이름
 * @param {() => Promise<any>} callback
 */
async function runModal(commandName, callback) {
  const ps = ensurePhotoshop();
  return ps.core.executeAsModal(callback, { commandName });
}

function getApp() {
  const ps = ensurePhotoshop();
  return ps.app;
}

module.exports = { runBatchPlay, runModal, getApp };
