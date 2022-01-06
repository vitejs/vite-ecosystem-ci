# vite-ecosystem-ci

This repository is used to run integration tests for vite ecosystem projects

## via github workflow

### scheduled

Workflows are sheduled to run automatically every Monday, Wednesday and Friday

### manually

* open [workflows](../../actions/workflows/) and select an action, eg [svelte](../../actions/workflows/svelte.yml)
* click 'Run workflow' button on top right of the list
* select options in popup and start

## via shell script

* clone this repo
* cd into a project directory and run it's shell script eg [svelte](./svelte)
* set options for refs and skip
* run with `./integration-test.sh`

# reporting results

## Discord

Results are posted automatically to #ecosystem-ci on [vite discord](https://chat.vitejs.dev/)

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
