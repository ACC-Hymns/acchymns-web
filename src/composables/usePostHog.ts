import posthog from 'posthog-js'

export function usePostHog() {
    posthog.init('phc_2ykxG0dZyno8rUEmVrwfsV2YvKjhMJH1jBMy4J8o3cg', {
        api_host: 'https://us.i.posthog.com',
        defaults: '2025-05-24',
    })

    return { posthog }
}