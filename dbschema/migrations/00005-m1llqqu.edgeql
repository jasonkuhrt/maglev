CREATE MIGRATION m1llqquj346hrvh5nzayxj7duvdjwuqfr2hjznxxc6zhzjhihrscfa
    ONTO m1ridknwffv4sbhw3fjcscbof43iai6wjqw3fux5yqli4hmxcnmc3q
{
  CREATE SCALAR TYPE default::ProjectStatus EXTENDING enum<deploying, active, failed>;
  CREATE TYPE default::DeploymentEvent {
      CREATE REQUIRED LINK project: default::Project;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE INDEX ON ((.project, .timestamp));
      CREATE INDEX ON (.timestamp);
      CREATE PROPERTY details: std::json;
      CREATE REQUIRED PROPERTY eventType: std::str;
      CREATE PROPERTY newStatus: default::ProjectStatus;
      CREATE PROPERTY oldStatus: default::ProjectStatus;
  };
  ALTER TYPE default::Project {
      DROP CONSTRAINT std::exclusive ON (.railwayProjectId);
      CREATE PROPERTY status: default::ProjectStatus {
          SET default := (default::ProjectStatus.deploying);
      };
      CREATE INDEX ON (.status);
      ALTER PROPERTY railwayProjectId {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.railwayProjectId);
  };
  CREATE TYPE default::Template {
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.code);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY description: std::str;
      CREATE PROPERTY githubRepos: array<std::str>;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE PROPERTY serializedConfig: std::json;
      CREATE PROPERTY serviceCount: std::int16 {
          SET default := 0;
      };
      CREATE PROPERTY updatedAt: std::datetime;
  };
  ALTER TYPE default::Project {
      CREATE LINK template: default::Template;
      CREATE PROPERTY deployedAt: std::datetime;
      CREATE PROPERTY lastError: std::json;
      CREATE PROPERTY railwayServiceIds: array<std::str>;
      CREATE PROPERTY railwayWorkflowId: std::str;
      ALTER PROPERTY templateId {
          RESET OPTIONALITY;
      };
      CREATE PROPERTY url: std::str;
  };
};
