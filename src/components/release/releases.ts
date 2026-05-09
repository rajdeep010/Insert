export type ReleaseEntry = {
  version: string
  label: string
  dateLabel: string
  kind: 'major' | 'minor'
  summary: string
  details: string
  image?: string
  imageAlt?: string
  tags: string[]
  sections: Array<{
    title: string
    description?: string
    items: string[]
  }>
}

export const releaseEntries: ReleaseEntry[] = [
  {
    version: 'v5.0',
    label: 'Collections, AG Grid improvements, and cleaner release visibility',
    dateLabel: 'Current release',
    kind: 'major',
    summary:
      'Public blog collections are now live, topic grids are more capable with AG Grid, and each problem can carry blog references for a tighter learning and release workflow.',
    details:
      'This release expands Insert from writing and release tooling into a more connected publishing flow. Collections let related posts travel together, topic tables are more powerful and easier to work with, and problem-level blog references make it easier to attach context, notes, and solutions directly where they are used.',
    image:
      'https://res.cloudinary.com/dgxeg3sju/image/upload/v1778338532/59be71dd-a64c-462f-b3b7-95243164471f.png',
    imageAlt: 'Topic grid improvements with AG Grid and problem blog references',
    tags: ['Public collections', 'AG Grid', 'Problem blog references', 'Release polish'],
    sections: [
      {
        title: 'Collections',
        description: 'Blog collections are now available publicly.',
        items: [
          'Added public blog collections with dedicated collection pages.',
          'Improved visibility handling so public collections behave correctly across shared surfaces.',
          'Made collection browsing more structured across the product.',
        ],
      },
      {
        title: 'Topic Grid',
        description: 'Topic management is improved with AG Grid updates.',
        items: [
          'Upgraded the topic grid experience with stronger AG Grid interactions.',
          'Improved the table workflow for browsing, scanning, and managing problem-heavy topics.',
          'Improved the grid for day-to-day problem tracking.',
        ],
      },
      {
        title: 'Problem References',
        description: 'Problems can now link directly to related writeups.',
        items: [
          'Added blog references for each problem.',
          'Made it easier to connect explanations, notes, and solution writeups to a specific problem.',
          'Improved the flow between solving and documenting problems.',
        ],
      },
      {
        title: 'Platform Polish',
        description: 'Several supporting flows were cleaned up in this release.',
        items: [
          'Cleaned up Pro state handling across shared user-facing surfaces.',
          'Improved release visibility and public/private behavior around newer features.',
          'Refined newer publishing workflows across shared surfaces.',
        ],
      },
    ],
  },
  {
    version: 'v4.0',
    label: 'Payments, Pro access, and account state improvements',
    dateLabel: 'Previous major release',
    kind: 'major',
    summary:
      'Insert Pro billing and access flows were introduced so paid capabilities could be unlocked cleanly across the product.',
    details:
      'This release established the payment foundation with Razorpay-backed Pro access, account-level Pro indicators, and the first pass of paid feature gating across the product. It set up the billing layer that later updates now refine with better account-state handling.',
    tags: ['Razorpay', 'Pro access', 'Billing foundation', 'Account state'],
    sections: [
      {
        title: 'Payments',
        description: 'Insert Pro payments were introduced in this release.',
        items: [
          'Added Razorpay-backed payment flow for enabling Insert Pro.',
          'Established the first complete paid upgrade path inside the product.',
          'Created the base subscription workflow for paid access.',
        ],
      },
      {
        title: 'Pro Access',
        description: 'Pro access was applied more consistently across the product.',
        items: [
          'Propagated Pro access across core product surfaces after upgrade.',
          'Prepared the feature gating model for more structured paid capabilities.',
          'Introduced clearer separation between free and paid access.',
        ],
      },
      {
        title: 'Account State',
        description: 'Account-level Pro state was added in the first version.',
        items: [
          'Added the first account-level Pro indicators.',
          'Established the groundwork for subscription status and billing-related state.',
          'Prepared the user model for subscription and billing state.',
        ],
      },
    ],
  },
]

export const latestRelease = releaseEntries[0]