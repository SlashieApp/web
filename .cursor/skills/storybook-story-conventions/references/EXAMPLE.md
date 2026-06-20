# Story Examples

## UI Example

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './card';

const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    thumbnail: '/press_release.png',
    link: 'https://example.com',
    title: 'Title',
    excerpt: 'Content',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## Section Example

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PressReleasesSection } from './pressReleasesSection';

const meta = {
  title: 'section/PressReleasesSection',
  component: PressReleasesSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    content: {
      sectionTitle: '**Press** Releases',
      buttonText: 'View All',
      buttonLink: '/press-releases',
    },
    blogs: [
      {
        id: 1,
        title: 'The 1st Blog',
        slug: 'the-1st-blog',
        excerpt: 'Example excerpt...',
        status: 'published',
        published_at: 'Oct 1, 2025',
        featured_image: 'https://example.com/image.png',
        featured_image_path: 'blogs/image.png',
      },
    ],
  },
} satisfies Meta<typeof PressReleasesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## Layout Example

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dropdown } from './Dropdown';

const meta = {
  title: 'ui/Dropdown',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClickWithJsxSlots: Story = { /* … */ };
```

## Header Example

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Header } from './Header';

const meta = {
  title: 'header/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Top-level headers get state stories (browse, dashboard, guest). */
export const BrowseLoggedIn: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  render: () => <Header />,
};
```

Non-universal menus get a single story:

```ts
const meta = {
  title: 'header/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { initialOpen: true },
} satisfies Meta<typeof AccountMenu>;

export const Default: Story = {};
```
