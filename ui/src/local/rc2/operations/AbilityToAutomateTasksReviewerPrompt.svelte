<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isSuited" boolean labelText="Did the applicant select an appropriate task(s) for automation?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldTextInput path="comment" labelText="Add any notable comments about their script" conditional={data.isSuited === true} />
