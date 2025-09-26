CREATE MIGRATION m1rkpftgl2kw4wsrygyskyuq6cjc6b54gl6dygiwf7jr6n2ht7voiq
    ONTO m1weimeeydiceqwwqh6my7xp6auabh5xtlm4zocvetf422lznuiwya
{
  ALTER TYPE default::Settings {
      ALTER PROPERTY railwayApiToken {
          RESET OPTIONALITY;
      };
  };
};
