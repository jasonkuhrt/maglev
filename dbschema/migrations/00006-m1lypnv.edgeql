CREATE MIGRATION m1lypnvkk3546iwtj2ftll6xgp7nsgb7qkcamsv22xdwckq3fsbdmq
    ONTO m1llqquj346hrvh5nzayxj7duvdjwuqfr2hjznxxc6zhzjhihrscfa
{
  DROP TYPE default::DeploymentEvent;
  ALTER TYPE default::Project {
      DROP INDEX ON (.status);
      DROP PROPERTY deployedAt;
      DROP PROPERTY lastError;
      DROP PROPERTY railwayEnvironmentId;
      DROP PROPERTY railwayServiceId;
      DROP PROPERTY railwayServiceIds;
      DROP PROPERTY railwayWorkflowId;
      DROP PROPERTY status;
      DROP PROPERTY url;
  };
  DROP SCALAR TYPE default::ProjectStatus;
};
