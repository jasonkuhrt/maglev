CREATE MIGRATION m1zp37cuo4tnsv2opwj75vv776evxftumgv7rrbi4lppw7qj76dt6a
    ONTO m1lypnvkk3546iwtj2ftll6xgp7nsgb7qkcamsv22xdwckq3fsbdmq
{
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY githubId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.githubId);
      CREATE PROPERTY avatarUrl: std::str;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY email: std::str;
      CREATE PROPERTY lastLoginAt: std::datetime;
      CREATE REQUIRED PROPERTY username: std::str;
  };
  ALTER TYPE default::Project {
      CREATE LINK owner: default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK projects := (.<owner[IS default::Project]);
  };
};
