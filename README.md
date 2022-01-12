# vite-ecosystem-ci

This repository is used to run integration tests for vite ecosystem projects

## via github workflow

### scheduled

Workflows are sheduled to run automatically every Monday, Wednesday and Friday

### manually

* open [workflow](../../actions/workflows/ecosystem-ci-selected.yml)
* click 'Run workflow' button on top right of the list
* select suite to run in dropdown
* start workflow

## via shell script

* clone this repo
* run `pnpm i`
* run `pnpm test` to run all suites
* or `pnpm test <suitename>` to select a suite

# how to add a new integration test

* check out the existing [tests](./tests) and add one yourself. Thanks to some utilities it is really easy
* once you are confidente the suite works, add it to the lists of suites in the [workflows](../../actions/)

> the current utilities focus on pnpm based projects. Consider switching to pnpm or contribute utilities for other pms

# reporting results

## Discord

Results are posted automatically to `#ecosystem-ci` on [vite discord](https://chat.vitejs.dev/)

### on your own server

* Go to `Server settings > Integrations > Webhooks` and click `New Webhook`
* Give it a name, icon and a channel to post to
* copy the webhook url 
* get in touch with admins of this repo so they can add the webhook

#### how to add a discord webhook here

* Go to `<github repo>/settings/hooks` and click on `Add webhook`
* paste the discord webhook url you copied from above into `Payload URL` and add `/github` to the end
* set `Content type` select to `application/json`
* Select `Let me select individual events`
* Tick the checkbox `Check runs`
* Click `Add webhook`
