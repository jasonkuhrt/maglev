CREATE MIGRATION m1wfs47kmqwjpnep42nupmu2osgv5hhzdazfasdnwtmwka3rwfmh7a
    ONTO m1rkpftgl2kw4wsrygyskyuq6cjc6b54gl6dygiwf7jr6n2ht7voiq
{
  ALTER TYPE default::Settings {
      CREATE PROPERTY theme: std::str {
          SET default := 'system';
          CREATE CONSTRAINT std::one_of('light', 'dark', 'system');
      };
  };
};
