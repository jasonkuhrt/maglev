CREATE MIGRATION m166y564sv6j4h53zntnxobvsdktmaqiwwuijyckbz655gpa644xrq
    ONTO m1gzporfdagqnj2yobcavqal4okou46a67ryad6ak7ukktybgtxrwq
{
  ALTER TYPE default::Project {
      DROP LINK template;
  };
  ALTER TYPE default::Project {
      CREATE REQUIRED PROPERTY templateId: std::str;
  };
  DROP TYPE default::Template;
};