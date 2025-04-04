### Run local dev (no docker)

1. Recommend NodeJS version on `.nvmrc` is `v22.13`. Enable corepack or install `pnpm@10.7.1` (present on the `package.json`)

1. Install dependencies:

    ```sh
    pnpm install
    ```

1. Copy the `.env.example` and set the missing values:

    ```sh
    cp .env.example .env
    ```

1. Run the necessary migrations (run it whenever you need to update the database):

    ```sh
    pnpx prisma migrate dev
    ```

    _This also runs the needed `prisma generate`_

1. Starts the app:

    ```sh
    pnpm dev
    ```

    or

    ```
    pnpm watch
    ```

### To build Docker image

```sh
docker build . --tag discord-heb`
```

_`discord-heb` is the tag I chosen for this example_

### To run the Docker image

1. Copy the `.env.example` and change what is needed.

    ```sh
    cp .env.example .env
    ```

1. For Docker, recommend to change the `DATABASE_URL` to
an absolute folder eg: `DATABASE_URL=/data/hebby.db` because it will be passed to the container.

1. **If you already have a database file, you may skip this.**

    1.1. To create a new database, you need to run the deploy command:

    ```sh
    docker run --rm -v "$(pwd)/data:/data" --env-file=.env discord-heb pnpm db:deploy
    ```

    _note the container tag: `discord-heb`_ and the command `pnpm db:deploy`

    1.1. If you need to update the database due new migrations:

    ```sh
    docker run --rm -v "$(pwd)/data:/data" --env-file=.env discord-heb pnpm db:push
    ```

1. To finally run:

    ```sh
    docker run --rm -v "$(pwd)/data:/data" --env-file=.env discord-heb
    ```
