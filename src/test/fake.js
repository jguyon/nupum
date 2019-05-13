const faker = require("faker");

beforeEach(() => {
  faker.seed(42);
});

export function fakePackageSearch({ size = 25 } = {}) {
  const publisher = fakeUser();

  return {
    total: faker.random.number({ min: size }),
    results: Array.from({ length: size }).map(() => ({
      searchScore: faker.random.number({ precision: 0.01 }),
      score: {
        final: fakeScore(),
        detail: {
          quality: fakeScore(),
          popularity: fakeScore(),
          maintenance: fakeScore(),
        },
      },
      package: {
        name: fakeSlug(),
        scope: "unscoped",
        version: faker.system.semver(),
        description: faker.random.boolean()
          ? faker.lorem.sentence()
          : undefined,
        keywords: faker.random.boolean()
          ? Array.from({ length: faker.random.number(9) }).map(() =>
              faker.lorem.word(),
            )
          : undefined,
        date: faker.date.past().toJSON(),
        links: {
          npm: faker.internet.url(),
          homepage: faker.random.boolean() ? faker.internet.url() : undefined,
          repository: faker.random.boolean() ? faker.internet.url() : undefined,
          bugs: faker.random.boolean() ? faker.internet.url() : undefined,
        },
        publisher,
        maintainers: Array.from({ length: faker.random.number(10) }).map(() =>
          fakeUser(),
        ),
      },
    })),
  };
}

function fakeScore() {
  return faker.random.number({ min: 0, max: 1, precision: 0.0001 });
}

function fakeSlug() {
  return faker.lorem.slug(faker.random.number({ min: 1, max: 5 }));
}

function fakeUser() {
  return {
    username: fakeSlug(),
    email: faker.internet.email(),
  };
}
