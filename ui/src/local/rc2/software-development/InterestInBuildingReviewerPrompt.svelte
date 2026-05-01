<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isInterested" boolean labelText="Does the applicant show interest in building or creating technical solutions?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldTextInput path="explanation" labelText="Explain your score" />
