<!--
  YesNoFollowUpDisplay — read-only counterpart to YesNoFollowUp. Renders
  one summary line ("<label>: Yes/No") followed by the conditional
  detail fields. Found in 11+ display components across the demos.

  Spec usage:
    display:
      template: YesNoFollowUpDisplay
      props:
        path: owned
        label: "Currently have cat(s)"
        details:
          - { path: count,   label: "Count" }
          - { path: details, label: "Details" }
        showDetailsWhen: yes        # `yes` (default) or `no`

  All `path:` references are validated against the prompt's model.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let path: string
  export let label: string = ''
  export let yesText: string = 'Yes'
  export let noText: string = 'No'
  export let details: { path: string, label: string }[] = []
  export let showDetailsWhen: 'yes' | 'no' = 'yes'

  $: parentValue = data?.[path]
  $: showDetails = showDetailsWhen === 'no' ? parentValue === false : parentValue === true
</script>

<p>{label}: {parentValue ? yesText : noText}</p>

{#if showDetails}
  {#each details as d (d.path)}
    {d.label}: {data?.[d.path] ?? ''}<br />
  {/each}
{/if}
