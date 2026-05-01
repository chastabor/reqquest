<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isIssueReal" boolean labelText="Is the issue real?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldRadio path="isSolutionFeasible" boolean labelText="Is the proposed feature/change technologically feasible?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
