<!--
  CardGridSelect — "do you still want to proceed? if so, choose one"
  pattern: a yes/no acceptance radio gates a sortable grid of cards
  (image, title, subhead, description, tags), and the selected card's id
  is mirrored into a hidden field on the prompt's data.

  Found in 3 demo prompts (AcceptCatPrompt, AcceptDogPrompt,
  AcceptFosterPetPrompt) and is generic enough to fit any "approved —
  pick one of these" UX.

  Spec usage:
    ui:
      form:
        template: CardGridSelect
        props:
          acceptPath: accept
          acceptLegend: "You've been approved! Do you still wish to adopt?"
          acceptYesLabel: "Adopt please!"
          acceptNoLabel:  "Something has changed :("
          idPath: id
          gridLegend: "Select a pet"
          adoptLabelTemplate: "Adopt {name}"          # `{field}` interpolates
          sortBy: age                                  # field name on each item
          # The cards read these field names on each fetched item:
          # name, age, picUrl, description, tags
          fields:
            title:       name
            subhead:     age
            image:       picUrl
            description: description
            tags:        tags

  The prompt's `fetch:` hook must populate `fetched` with an array of
  `{ id, <title>, <subhead>, <image>, <description>, <tags> }`.
-->
<script lang="ts">
  import { FieldHidden, FieldRadio, Card } from '@txstate-mws/carbon-svelte'
  import { RadioButton, RadioButtonGroup } from 'carbon-components-svelte'

  export let data: Record<string, any>
  export let fetched: any[] = []

  export let acceptPath: string = 'accept'
  export let acceptLegend: string = ''
  export let acceptYesLabel: string = 'Yes'
  export let acceptNoLabel: string = 'No'

  export let idPath: string = 'id'
  export let gridLegend: string = ''
  export let adoptLabelTemplate: string = 'Select {name}'
  export let sortBy: string | undefined = 'age'

  export let fields: { title?: string, subhead?: string, image?: string, description?: string, tags?: string } = {}
  $: f = { title: 'name', subhead: 'age', image: 'picUrl', description: 'description', tags: 'tags', ...fields }

  let selected: any
  $: selectedId = selected ?? null

  $: items = sortBy != null && fetched
    ? [...fetched].sort((a, b) => (a?.[sortBy] ?? 0) - (b?.[sortBy] ?? 0))
    : (fetched ?? [])

  function interpolate (template: string, item: any): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(item?.[key] ?? ''))
  }
</script>

<FieldRadio
  boolean
  path={acceptPath}
  legendText={acceptLegend}
  items={[{ label: acceptYesLabel, value: true }, { label: acceptNoLabel, value: false }]}
/>

{#if data?.[acceptPath]}
  <RadioButtonGroup legendText={gridLegend} bind:selected>
    <div class="card-radio-grid">
      {#each items as item (item.id)}
        {@const cardImage = { src: item?.[f.image], alt: `${item?.[f.title]} picture` }}
        <div class="card-radio-item">
          <Card
            title={item?.[f.title]}
            subhead={item?.[f.subhead]}
            image={cardImage}
            tags={item?.[f.tags] ?? []}
          >
            <p>{item?.[f.description]}</p>
          </Card>
          <div class="radio-wrapper">
            <br>
            <RadioButton value={item.id} labelText={interpolate(adoptLabelTemplate, item)} />
            <br>
          </div>
        </div>
      {/each}
    </div>
  </RadioButtonGroup>
  <FieldHidden path={idPath} value={selectedId} />
{/if}
