<!--
  ResidencePrompt — applicant residency block. Captures the
  firstName/lastName/contact/address/state/zipCode shape with optional
  outer boolean gate ("Are you a resident of X?") and optional
  identifying-document upload. Used by the `simple` and `complex` demos.

  Spec usage (gated, state from config — `simple`-style):
    ui:
      form:
        template: ResidencePrompt
        props:
          gate:
            path: residentOfRequiredState
            legend: "Are you a resident of {{config.residentOfState}}?"
            showWhen: yes
          upload:
            path:  residentIdDoc
            label: "Residence identification document"

  Spec usage (no gate, state via Select — `complex`-style):
    ui:
      form:
        template: ResidencePrompt
        props:
          stateItems: # populated from a fetched ref data list
            - { value: Texas,  label: Texas }
            - { value: Oregon, label: Oregon }
          upload:
            path:             residentIdDoc
            label:            "Residence identification document"
            requiredFlagPath: residentIdDocRequired

  Data fields the prompt's model must declare:
    firstName, lastName, phoneNumber, emailAddress,
    streetAddress, city, zipCode, state (when stateItems is set),
    plus the gate/upload paths if used.

  All field paths are validated against the prompt's model schema by the
  generator.
-->
<script lang="ts">
  import { FieldHidden, FieldRadio, FieldSelect, FieldTextInput, FieldUpload } from '@txstate-mws/carbon-svelte'

  export let data: Record<string, any> = {}

  // Optional outer gate. If set, all subsequent fields are conditional on it.
  export let gate: { path: string, legend: string, showWhen?: 'yes' | 'no' } | undefined = undefined

  // Optional state field. If `stateItems` is given, render a FieldSelect.
  // Otherwise the state is assumed to come from elsewhere (gathered config,
  // hidden field, or rendered separately).
  export let stateItems: { value: string, label: string }[] | undefined = undefined
  export let statePath: string = 'state'
  export let stateLabel: string = '* State'

  // Optional id-doc upload. Pass `false` to omit entirely.
  export let upload:
    | { path: string, label: string, requiredFlagPath?: string }
    | false
    = { path: 'residentIdDoc', label: 'Residence identification document' }

  $: gateOpen = gate == null
    || (gate.showWhen === 'no' ? data?.[gate.path] === false : data?.[gate.path] === true)
</script>

{#if gate}
  <FieldRadio
    boolean
    path={gate.path}
    legendText={gate.legend}
    items={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
  />
{/if}

{#if gateOpen}
  <FieldTextInput path="firstName"     labelText="* Firstname" />
  <FieldTextInput path="lastName"      labelText="* Lastname" />
  <FieldTextInput path="phoneNumber"   labelText="Phone Number" />
  <FieldTextInput path="emailAddress"  labelText="Email address" />
  <FieldTextInput path="streetAddress" labelText="* Street Address" />
  <FieldTextInput path="city"          labelText="* City" />
  {#if stateItems}
    <FieldSelect path={statePath} labelText={stateLabel} items={stateItems} />
  {/if}
  <FieldTextInput path="zipCode"       labelText="* Zipcode" />
  {#if upload}
    <FieldUpload path={upload.path} labelText={upload.label} />
    {#if upload.requiredFlagPath}
      <FieldHidden path={upload.requiredFlagPath} value={true} />
    {/if}
  {/if}
{/if}
