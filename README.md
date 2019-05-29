# [nupum](https://nupum.now.sh/)

A web app for searching npm packages, built with an emphasis on speed.

I started this project to test my abilities with React. As such, I made the
decision to implement things from scratch wherever it was interesting to do so.
I wouldn't have implemented my own router or rolled my own autocomplete in a
real world project, but doing so there was a great way to learn.
[Don't Reinvent The Wheel, Unless You Plan on Learning More About Wheels](https://blog.codinghorror.com/dont-reinvent-the-wheel-unless-you-plan-on-learning-more-about-wheels/).

## Feature highlights

- **Server-side rendering**: the project follows a progressive enhancement
  philosophy, it is almost completely usable before the javascript has been
  downloaded and run.
- **Loading spinners only when needed**: switching pages happens only once the
  data needed for rendering the next page has been fetched, improving perceived
  performance, showing a loading spinner only if fetching the data is taking too
  long.
- **Smart pre-fetching of data**: hints that the user is going to switch to a
  page, like hovering a link or selecting a package in the search suggestions,
  trigger a pre-fetch of the relevant page so that actually switching to the
  page can be instant.
- **Network cache**: all network requests are cached using an LRU mechanism,
  making going back to a previous page instant.

## Local development

```sh
git clone https://github.com/jguyon/nupum.git
cd nupum
npm install -g now
now dev
```
