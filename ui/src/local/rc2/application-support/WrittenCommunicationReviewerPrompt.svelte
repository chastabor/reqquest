<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isWellDefined" boolean labelText="Review Applicant written instructions" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
