import { Knex } from 'knex'
import fs from 'fs'

export async function up(knex) {
  const sqlPath = path.join(__dirname, '001_up_database.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  return knex.raw(sql)
}

export async function down(knex) {
  const sqlPath = path.join(__dirname, '001_down_database.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  return knex.raw(sql)
}