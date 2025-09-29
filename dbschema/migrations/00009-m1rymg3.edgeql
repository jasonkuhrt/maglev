CREATE MIGRATION m1rymg3kilqw3wxnvohrlu4bazpycijsj4npsyyyzps5yoqrjxyhxa
    ONTO m1kb2wdazo7pu6alba43aaag7uvdd6idarj5gpoapdaom4ifyxplia
{
  ALTER TYPE default::Settings {
      ALTER LINK user {
          SET REQUIRED USING (<default::User>{});
      };
  };
};
