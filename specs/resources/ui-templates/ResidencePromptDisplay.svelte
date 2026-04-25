<!--
  ResidencePromptDisplay — read-only counterpart to ResidencePrompt.
  Renders the formatted address block and (when an identifying document
  is on file) a "Display Id file" button that opens a Modal showing the
  fetched image.

  The "is this applicant a resident?" check varies between projects
  (one project keys off a boolean, another off a config-driven state
  list), so the caller passes the resolved boolean as `isResident:`.
  The wrapper file emitted by the generator computes that from a
  spec-level expression.

  Spec usage:
    display:
      template: ResidencePromptDisplay
      props:
        promptKey: state_residence_prompt
        # `isResident:` is computed by the generated wrapper; for example
        # the spec-level expression "residentOfRequiredState" will be
        # emitted as `isResident={data.residentOfRequiredState}`.
        isResident: residentOfRequiredState
        stateLabel: "{{config.residentOfState}}"   # what to display for state
        notResidentMessage: "Not a resident of {{config.residentOfState}}."
        # Optional overrides:
        uploadField: residentIdDoc
        downloadButtonLabel: "Display Id file"
        modalHeading: "Applicant identifying document"

  The download endpoint is `${PUBLIC_API_BASE}/download/<appRequestId>/<promptKey>/<uploadField>/shasum`
  with a Bearer token from `sessionStorage`.
-->
<script lang="ts">
  import { PUBLIC_API_BASE } from '$env/static/public'
  import { Button, Modal, ToastNotification } from 'carbon-components-svelte'

  export let data: Record<string, any> = {}
  export let appRequestId: string | undefined = undefined
  export let promptKey: string

  export let isResident: boolean = true
  export let stateLabel: string = ''
  export let notResidentMessage: string = 'Not a resident.'

  export let uploadField: string = 'residentIdDoc'
  export let downloadButtonLabel: string = 'Display Id file'
  export let modalHeading: string = 'Applicant identifying document'

  let objURL: string | null = null
  let displayIdFileErr: string | null = null
  let modalOpen = false

  async function displayIdFile (): Promise<boolean> {
    if (objURL) { displayIdFileErr = null; return true }
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null
      const ep = `${PUBLIC_API_BASE}/download/${appRequestId}/${promptKey}/${uploadField}/shasum`
      const res = await fetch(ep, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      objURL = URL.createObjectURL(await res.blob())
    } catch (err) {
      displayIdFileErr = err instanceof Error ? err.message : String(err)
      return false
    }
    displayIdFileErr = null
    return true
  }

  $: hasUpload = data?.[uploadField] != null
</script>

{#if isResident}
  {#if stateLabel}<p>Resident of {stateLabel}</p>{/if}
  <p>
    <b>
      {data.firstName ?? ''} {data.lastName ?? ''}<br />
      {data.streetAddress ?? ''}<br />
      {data.city ?? ''}{stateLabel ? `, ${stateLabel}` : ''} {data.zipCode ?? ''}
    </b>
  </p>
  {#if hasUpload}
    <p>
      <Button on:click={async () => { modalOpen = await displayIdFile() }}>{downloadButtonLabel}</Button>
    </p>
  {/if}
{:else}
  <p>{notResidentMessage}</p>
{/if}

<Modal
  bind:open={modalOpen}
  modalHeading={modalHeading}
  primaryButtonText="Close"
  on:click:button--primary={() => { modalOpen = false }}
  on:open
>
  {#if objURL}<img src={objURL} alt="Identifying file" />{/if}
</Modal>

{#if !objURL && displayIdFileErr}
  <ToastNotification title="Error" subtitle={displayIdFileErr} timeout={5000} />
{/if}
