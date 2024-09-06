# Captcha solver Deno


## Getting started

To get started with this demo, first install the npm dependencies:

```bash
npm install
```

The solver can be run with 

```bash
npm run solve
```

## Input
The algorithm will expect the file `captcha.png` in the root folder. For a quick demo you can use the provided file `example.png`.

```bash
cp expample.png captcha.png
```

## Output
The algorithm will output the solution to the console and some intermediate images to the `/output` folder. So it's possible to track the progress of the algorithm.

## Learn more
This demo is part of a blog article published for [Koona Labs](https://koona-labs.deblog/solving-the-aws-car-path-captcha). The article will explain the algorithm in detail and show how to implement it in NodeJs.
