# svelte-vite-integration-test

This repository is used to run integration tests for vite and svelte

## via github workflow

* go to [action](../../actions/workflows/integration-test.yml)
* click 'Run workflow' button on top right of the list
* select options in popup and start

## via shell script
* clone this repo
* check [shell script](./integration-test.sh)
* set options for refs and skip
* run with `./integration-test.sh`

# reporting results

## Discord

If you want to get results of test runs posted to your discord server, follow these steps

### create a new webook on your discord server 

* Go to `Server settings > Integrations > Webhooks` and click `New Webhook`
* Give it a name, icon and a channel to post to
* copy the webhook url 

### add the webhook to you git repo
* Go to `<github repo>/settings/hooks` and click on `Add webhook`
* paste the discord webhook url you copied from above into `Payload URL` and add `/github` to the end
* set `Content type` select to `application/json`
* Select `Let me select individual events`
* Tick the checkbox `Check runs`
* Click `Add webhook`

Now every time a workflow run ends, the discord webhook should post a message informing you about the result.
