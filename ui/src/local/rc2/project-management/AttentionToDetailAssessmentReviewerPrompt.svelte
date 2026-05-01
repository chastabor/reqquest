<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isCompliant" boolean labelText="Does the applicant follow instructions?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldRadio path="isProofread" boolean labelText="Do their materials have frequent spelling or grammar errors?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
