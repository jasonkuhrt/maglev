CREATE MIGRATION m1ridknwffv4sbhw3fjcscbof43iai6wjqw3fux5yqli4hmxcnmc3q
    ONTO m1wfs47kmqwjpnep42nupmu2osgv5hhzdazfasdnwtmwka3rwfmh7a
{
  ALTER TYPE default::Settings {
      ALTER PROPERTY theme {
          DROP CONSTRAINT std::one_of('light', 'dark', 'system');
      };
  };
  CREATE SCALAR TYPE default::Theme EXTENDING enum<light, dark, system>;
  ALTER TYPE default::Settings {
      ALTER PROPERTY theme {
          SET default := (default::Theme.system);
          SET TYPE default::Theme;
      };
  };
};
