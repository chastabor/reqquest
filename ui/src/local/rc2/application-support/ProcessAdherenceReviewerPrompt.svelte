<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isAttentive" boolean labelText="Can applicant follow/validate process?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
