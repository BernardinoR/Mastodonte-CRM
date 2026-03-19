INSERT INTO "institutions" ("name") VALUES
  ('Sicoob'), ('Safra'), ('Mercado Bitcoin'), ('Singulare')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "institutions" ("name", "currency") VALUES
  ('Revolut', 'Dolar')
ON CONFLICT ("name") DO NOTHING;
