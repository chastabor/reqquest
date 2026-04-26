<!--
  YesNoFollowUp — boolean radio with one or more conditional follow-up
  fields. Captures the (very common) "Do you X? If so / not, …?" shape.
  Found in 15+ prompts across the demos.

  Spec usage (single follow-up, sugar form):
    ui:
      form:
        template: YesNoFollowUp
        props:
          path: haveCatTower
          legend: "Do you have a cat tower in your house?"
          followUp:
            path: willPurchaseCatTower
            label: "I agree to purchase a cat tower upon adoption."
            showWhen: "no"

  Spec usage (multiple typed follow-ups):
    ui:
      form:
        template: YesNoFollowUp
        props:
          path: owned
          legend: "Are there any cats in the home currently?"
          followUps:
            - { type: number, path: count,   label: "How many?",                 showWhen: yes }
            - { type: text,   path: details, label: "Please provide more details?", showWhen: yes }

  Each follow-up's `path:` is validated against the prompt's model
  schema. `showWhen:` is `yes` (parent answered true) or `no` (parent
  answered false); defaults to `yes`.
-->
<script lang="ts">
  import { FieldCheckbox, FieldNumber, FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'

  type FollowUpType = 'checkbox' | 'number' | 'text' | 'radio'
  interface FollowUp {
    type: FollowUpType
    path: string
    label: string
    showWhen?: 'yes' | 'no'
    helperText?: string
    placeholder?: string
    items?: { value: any, label: string }[]
  }

  export let data: Record<string, any>
  export let path: string
  export let legend: string = ''
  export let yesFirst: boolean = true
  export let followUps: FollowUp[] = []
  // Sugar form: `followUp:` (singular) becomes a single checkbox follow-up.
  export let followUp: { path: string, label: string, showWhen?: 'yes' | 'no' } | undefined = undefined

  $: items = yesFirst
    ? [{ label: 'Yes', value: true }, { label: 'No', value: false }]
    : [{ label: 'No', value: false }, { label: 'Yes', value: true }]

  $: parentValue = data?.[path]

  $: effectiveFollowUps = followUp
    ? [{ type: 'checkbox' as const, ...followUp }, ...followUps]
    : followUps

  function isShown (showWhen: 'yes' | 'no' = 'yes'): boolean {
    return showWhen === 'no' ? parentValue === false : parentValue === true
  }
</script>

<FieldRadio boolean {path} legendText={legend} {items} />

{#each effectiveFollowUps as fu (fu.path)}
  {#if fu.type === 'checkbox'}
    <FieldCheckbox boolean path={fu.path} labelText={fu.label} conditional={isShown(fu.showWhen)} />
  {:else if fu.type === 'number'}
    <FieldNumber path={fu.path} labelText={fu.label} helperText={fu.helperText} conditional={isShown(fu.showWhen)} />
  {:else if fu.type === 'text'}
    <FieldTextInput path={fu.path} labelText={fu.label} helperText={fu.helperText} placeholder={fu.placeholder} conditional={isShown(fu.showWhen)} />
  {:else if fu.type === 'radio'}
    <FieldRadio boolean path={fu.path} legendText={fu.label} items={fu.items ?? items} conditional={isShown(fu.showWhen)} />
  {/if}
{/each}
