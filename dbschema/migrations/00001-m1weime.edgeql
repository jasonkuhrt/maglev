CREATE MIGRATION m1weimeeydiceqwwqh6my7xp6auabh5xtlm4zocvetf422lznuiwya
    ONTO initial
{
  CREATE TYPE default::Project {
      CREATE REQUIRED PROPERTY railwayProjectId: std::str;
      CREATE CONSTRAINT std::exclusive ON (.railwayProjectId);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE INDEX ON (.createdAt);
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE PROPERTY railwayEnvironmentId: std::str;
      CREATE PROPERTY railwayServiceId: std::str;
      CREATE REQUIRED PROPERTY templateId: std::str;
      CREATE PROPERTY updatedAt: std::datetime;
  };
  CREATE TYPE default::Settings {
      CREATE CONSTRAINT std::exclusive ON (true);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY gelDsn: std::str;
      CREATE REQUIRED PROPERTY railwayApiToken: std::str;
      CREATE PROPERTY updatedAt: std::datetime;
  };
};
