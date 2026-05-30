const pool = require("../config/db");
const { tick } = require("./lamportClock");

const SERVICE_ID = "rebu";

async function registrarEvento(
  corridaId,
  eventType,
  payload = {},
  level = "INFO"
) {
  const logicalTimestamp = tick();

  const evento = {
    level,
    eventType,
    serviceId: SERVICE_ID,
    logicalTimestamp,
    wallClockTime: new Date().toISOString(),
    payload
  };

  console.log(JSON.stringify(evento));

  await pool.query(
    `INSERT INTO audit_logs (
      corrida_id,
      event_type,
      service_id,
      logical_timestamp,
      wall_clock_time,
      payload
    )
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      corridaId,
      eventType,
      SERVICE_ID,
      logicalTimestamp,
      evento.wallClockTime,
      payload
    ]
  );

  await pool.query(
    `UPDATE corridas
     SET logical_timestamp = $1
     WHERE id = $2`,
    [logicalTimestamp, corridaId]
  );

  return evento;
}

module.exports = {
  registrarEvento
};