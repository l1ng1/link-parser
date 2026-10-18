<template>

    <div class="pt-8 sm:pt-12">
        <NuxtLink to="/" class="text-sm text-muted underline-offset-4 hover:text-highlighted hover:underline">Back to library</NuxtLink>

        <p v-if="error" class="py-10 text-highlighted" role="alert">{{ errorText }}</p>

        <p v-else-if="!item" class="py-10 text-muted">Opening…</p>

        <article v-else class="mx-auto mt-8 max-w-[40rem] sm:mt-12">
            <h1 class="font-serif text-3xl leading-tight font-semibold text-balance text-highlighted sm:text-[2.5rem]">{{ title }}</h1>

            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <a v-if="item.title" :href="item.url" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4 hover:text-highlighted">{{ host }}</a>
                <span v-if="item.type === 'video' && item.description">{{ item.description }}</span>
                <span>Saved <NuxtTime :datetime="item.createdAt" day="numeric" month="long" year="numeric" /></span>
            </div>

            <div v-if="videoId" class="mt-8 aspect-video w-full overflow-hidden rounded-sm bg-black">
                <iframe
                    :src="`https://www.youtube-nocookie.com/embed/${videoId}`"
                    :title="title"
                    class="h-full w-full"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerpolicy="strict-origin-when-cross-origin"
                />
            </div>

            <!-- content is sanitized on the server (server/utils/parser.ts) before it's stored -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-else-if="item.content" class="reader mt-10" v-html="item.content" />

            <div v-else class="mt-10 border-l-2 border-(--ui-text-highlighted) pl-5">
                <p v-if="item.status === 'pending'" class="font-serif text-lg text-highlighted">Still reading the page. This usually takes a few seconds.</p>
                <p v-else-if="item.status === 'failed'" class="font-serif text-lg text-highlighted">Couldn't read this page.</p>
                <p v-else class="font-serif text-lg text-highlighted">This page has no text we could pull out.</p>
                <p v-if="item.status !== 'pending'" class="mt-2 text-muted">
                    <a :href="item.url" target="_blank" rel="noopener noreferrer" class="text-highlighted underline underline-offset-4">Read it on {{ host }}</a>
                </p>
            </div>

            <div class="mt-16 flex items-center justify-between gap-4 border-t border-default pt-5 text-sm">
                <a :href="item.url" target="_blank" rel="noopener noreferrer" class="text-muted underline-offset-4 hover:text-highlighted hover:underline">Open the original</a>
                <button type="button" class="text-muted underline-offset-4 hover:text-highlighted hover:underline" @click="handleDelete">Remove from library</button>
            </div>
        </article>
    </div>

</template>
<script setup lang="ts">
import { FetchError } from 'ofetch'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { data: item, error } = useItem(id)
const { mutateAsync: removeItem, cache } = useDeleteItem()
const toast = useToast()

const host = computed(() => (item.value ? displayHost(item.value.url) : ''))
const title = computed(() => item.value?.title || host.value)
const videoId = computed(() => (item.value?.type === 'video' ? getYoutubeVideoId(item.value.url) : null))

const errorText = computed(() => {
    const e = error.value
    if (e instanceof FetchError && (e.statusCode === 404 || e.statusCode === 422)) return "This item isn't in your library. It may have been removed."
    return "Couldn't open this item. Refresh the page to try again."
})

async function handleDelete() {
    if (!confirm('Remove this item from your library?')) return
    try {
        await removeItem(id.value)
        await cache.invalidateQueries({ key: ['items'] })
        await navigateTo('/')
    } catch {
        toast.add({ title: "Couldn't remove the item", description: 'Check your connection and try again.' })
    }
}

useHead({ title: () => item.value?.title || 'Reading' })

</script>
