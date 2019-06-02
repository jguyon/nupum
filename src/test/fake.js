import faker from "faker";
import invariant from "tiny-invariant";

beforeEach(() => {
  faker.seed(42);
});

export function fakePackageSearch({ size = 25 } = {}) {
  return {
    total: faker.random.number({ min: size }),
    results: Array.from({ length: size }).map(() => {
      const publisher = fakeUser();

      return {
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
            repository: faker.random.boolean()
              ? faker.internet.url()
              : undefined,
            bugs: faker.random.boolean() ? faker.internet.url() : undefined,
          },
          publisher,
          maintainers: [
            publisher,
            ...Array.from({ length: faker.random.number(10) }).map(() =>
              fakeUser(),
            ),
          ],
        },
      };
    }),
  };
}

export function fakePackageSuggestions({ size = 25 } = {}) {
  return Array.from({ length: size }).map(() => {
    const name = fakeSlug();
    const publisher = fakeUser();

    return {
      highlight: name,
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
        name,
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
        maintainers: [
          publisher,
          ...Array.from({ length: faker.random.number(9) }).map(() =>
            fakeUser(),
          ),
        ],
      },
    };
  });
}

export function fakePackageInfo() {
  const publisher = fakeUser();

  return {
    analyzedAt: faker.date.past().toJSON(),
    collected: {
      metadata: {
        name: fakeSlug(),
        scope: "unscoped",
        version: faker.system.semver(),
        license: faker.random.boolean() ? "MIT" : undefined,
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
        repository: faker.random.boolean()
          ? {
              type: "git",
              url: faker.internet.url(),
            }
          : undefined,
        dependencies: faker.random.boolean() ? fakeDeps() : undefined,
        devDependencies: faker.random.boolean() ? fakeDeps() : undefined,
        peerDependencies: faker.random.boolean() ? fakeDeps() : undefined,
        releases: Array.from({ length: faker.random.number(5) }).map(() => ({
          from: faker.date.past().toJSON(),
          to: faker.date.past().toJSON(),
          count: faker.random.number(),
        })),
        hasTestScript: faker.random.boolean(),
        hasSelectiveFiles: faker.random.boolean(),
        readme: faker.random.boolean() ? faker.lorem.sentences() : undefined,
      },
      npm: {
        dependentsCount: faker.random.number(),
        starsCount: faker.random.number(),
        downloads: Array.from({ length: faker.random.number(5) }).map(() => ({
          from: faker.date.past().toJSON(),
          to: faker.date.past().toJSON(),
          count: faker.random.number(),
        })),
      },
      github: faker.random.boolean()
        ? undefined
        : {
            homepage: faker.internet.url(),
            starsCount: faker.random.number(),
            forksCount: faker.random.number(),
            subscribersCount: faker.random.number(),
            issues: {
              count: faker.random.number(),
              openCount: faker.random.number(),
              isDisabled: faker.random.boolean(),
            },
            contributors: Array.from({ length: faker.random.number(10) }).map(
              () => ({
                username: fakeSlug(),
                commitsCount: faker.random.number(),
              }),
            ),
            commits: Array.from({ length: faker.random.number(5) }).map(() => ({
              from: faker.date.past().toJSON(),
              to: faker.date.past().toJSON(),
              count: faker.random.number(),
            })),
            statuses: [],
          },
    },
    evaluation: {
      quality: {
        carefulness: fakeScore(),
        tests: fakeScore(),
        health: fakeScore(),
        branding: fakeScore(),
      },
      popularity: {
        communityInterest: faker.random.number(),
        downloadsCount: faker.random.number(),
        downloadsAcceleration: faker.random.number(),
        dependentsCount: faker.random.number(),
      },
      maintenance: {
        releasesFrequency: fakeScore(),
        commitsFrequency: fakeScore(),
        openIssues: fakeScore(),
        issuesDistribution: fakeScore(),
      },
    },
    score: {
      final: fakeScore(),
      detail: {
        quality: fakeScore(),
        popularity: fakeScore(),
        maintenance: fakeScore(),
      },
    },
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

function fakeDeps() {
  const deps = {};
  const count = faker.random.number(10);

  for (let i = 0; i < count; i++) {
    deps[fakeSlug()] = faker.system.semver();
  }

  return deps;
}

export function fakePackageBrowserSize({ name, version }) {
  invariant(typeof name === "string", "expected name to be a string");
  invariant(typeof version === "string", "expected version to be a string");

  return {
    name,
    version,
    scoped: faker.random.boolean(),
    description: faker.random.boolean() ? faker.lorem.sentence() : undefined,
    repository: faker.internet.url(),
    hasJSModule: faker.random.boolean(),
    hasJSNext: faker.random.boolean(),
    hasSideEffects: faker.random.boolean(),
    size: faker.random.number(),
    gzip: faker.random.number(),
    dependencyCount: faker.random.number(20),
    dependencySizes: Array.from({ length: faker.random.number(9) }).map(() => ({
      approximateSize: faker.random.number(),
      name: fakeSlug(),
    })),
  };
}
