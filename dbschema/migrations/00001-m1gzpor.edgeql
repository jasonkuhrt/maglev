CREATE MIGRATION m1gzporfdagqnj2yobcavqal4okou46a67ryad6ak7ukktybgtxrwq
    ONTO initial
{
  CREATE TYPE default::Template {
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE CONSTRAINT std::exclusive ON (.name);
      CREATE REQUIRED PROPERTY order: std::int32;
      CREATE INDEX ON (.order);
      CREATE REQUIRED PROPERTY category: std::str {
          CREATE CONSTRAINT std::one_of('frontend', 'backend', 'fullstack');
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY githubRepo: std::str;
      CREATE PROPERTY previewImage: std::str;
      CREATE REQUIRED PROPERTY shortDescription: std::str;
      CREATE REQUIRED PROPERTY status: std::str {
          CREATE CONSTRAINT std::one_of('available', 'coming-soon');
      };
      CREATE REQUIRED PROPERTY techStack: array<std::str>;
  };
  CREATE TYPE default::Project {
      CREATE REQUIRED PROPERTY railwayProjectId: std::str;
      CREATE CONSTRAINT std::exclusive ON (.railwayProjectId);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE INDEX ON (.createdAt);
      CREATE REQUIRED LINK template: default::Template;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE PROPERTY railwayEnvironmentId: std::str;
      CREATE PROPERTY railwayServiceId: std::str;
      CREATE PROPERTY updatedAt: std::datetime;
  };
};
