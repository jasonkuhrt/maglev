CREATE MIGRATION m1kb2wdazo7pu6alba43aaag7uvdd6idarj5gpoapdaom4ifyxplia
    ONTO m1zp37cuo4tnsv2opwj75vv776evxftumgv7rrbi4lppw7qj76dt6a
{
  ALTER TYPE default::Settings {
      DROP CONSTRAINT std::exclusive ON (true);
      CREATE LINK user: default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.user);
  };
  ALTER TYPE default::User {
      CREATE LINK settings := (.<user[IS default::Settings]);
  };
};
