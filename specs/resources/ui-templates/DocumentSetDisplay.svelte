<!--
  DocumentSetDisplay — read-only counterpart to DocumentSet. Lists each
  expected document's filename and KB size, or "No document uploaded" if
  the path is empty. If a document has an optional `textInput`, its value
  is rendered before the upload entry.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let documents: {
    path: string
    label: string
    textInput?: { path: string, labelText: string, helperText?: string, placeholder?: string }
  }[] = []
</script>

<dl>
  {#each documents as doc (doc.path)}
    {#if doc.textInput}
      <dt>{doc.textInput.labelText}</dt>
      {#if data?.[doc.textInput.path]}
        <dd>{data[doc.textInput.path]}</dd>
      {:else}
        <dd>Not provided.</dd>
      {/if}
    {/if}
    <dt>{doc.label}</dt>
    {#if data?.[doc.path]}
      <dd>{data[doc.path].name} ({Math.round(data[doc.path].size / 1024)} KB)</dd>
    {:else}
      <dd>No document uploaded.</dd>
    {/if}
  {/each}
</dl>
