import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('scores', table => {
    table.integer('cv').notNullable().defaultTo(0);
  });

  await knex.schema.alterTable('favoris', table => {
    table.text('pdf').defaultTo('none').notNullable();
  });
  await knex.raw(`
    DELETE FROM favoris
    WHERE ctid NOT IN (
      SELECT min(ctid)
      FROM favoris
      GROUP BY "userId", "link", "favFolderId", "pdf"
    )
  `);

  await knex.schema.alterTable('favoris', table => {
    table.string('link').defaultTo('none').notNullable().alter();
    table.renameColumn('desc', 'resume');
    table.dropUnique(['userId', 'link', 'favFolderId']);
    table.unique(['userId', 'link', 'favFolderId', 'pdf']);
  });

  await knex.schema.alterTable('searches', table => {
    table.boolean('isCv').notNullable().defaultTo(false);
  });

  const exists = await knex.schema.hasTable('event');
  if (exists) {
    await knex.schema.dropTable('event');
  }
}

export async function down(knex: Knex): Promise<void> {
  const columnsToRemove = [
    { table: 'scores', column: 'cv' },
    { table: 'favoris', column: 'pdf' },
    { table: 'searches', column: 'isCv' },
    { table: 'favoris', column: 'isCv' },
  ];

  for (const { table, column } of columnsToRemove) {
    const hasColumn = await knex.schema.hasColumn(table, column);
    if (hasColumn) {
      await knex.schema.alterTable(table, t => {
        t.dropColumn(column);
      });
    }
  }

  await knex.raw(`
    DO $$
    BEGIN
    IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'favoris_userid_link_favfolderid_pdf_unique'
    ) THEN
    ALTER TABLE "favoris" DROP CONSTRAINT "favoris_userid_link_favfolderid_pdf_unique";
    END IF;
    END
    $$;
    `);

  await knex.raw(`
      DO $$
      BEGIN
      IF NOT EXISTS (
      SELECT 1 
      FROM pg_constraint 
      WHERE conname = 'favoris_userid_link_favfolderid_unique'
      ) THEN
      ALTER TABLE "favoris" ADD CONSTRAINT "favoris_userid_link_favfolderid_unique" UNIQUE ("userId", "link", "favFolderId");
      END IF;
      END
      $$;
      `);
  const hasResumeColumn = await knex.schema.hasColumn('favoris', 'resume');
  await knex.schema.alterTable('favoris', table => {
    table.string('link').notNullable().alter();
    if (hasResumeColumn) {
      table.renameColumn('resume', 'desc');
    }
  });
}
