import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { PostJobForm } from './PostJobForm'

function PostJobFormStory() {
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState(
    'Kitchen tap leaks under the sink. Flexible hours this week.',
  )
  const [location, setLocation] = useState('Hackney, London')
  const [dateTimeLocal, setDateTimeLocal] = useState('2026-03-23T09:30')
  const [category, setCategory] = useState('Plumbing')
  const [priceOfferPence, setPriceOfferPence] = useState('4500')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [contactMethod, setContactMethod] = useState('WhatsApp')
  const [error, setError] = useState<string | null>(null)

  return (
    <Box maxW="1100px" mx="auto" py={8}>
      <PostJobForm
        title={title}
        description={description}
        location={location}
        dateTimeLocal={dateTimeLocal}
        category={category}
        priceOfferPence={priceOfferPence}
        paymentMethod={paymentMethod}
        contactMethod={contactMethod}
        paymentMethodOptions={[
          { value: 'CASH', label: 'Cash' },
          { value: 'BANK_TRANSFER', label: 'Bank transfer' },
        ]}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onLocationChange={setLocation}
        onDateTimeLocalChange={setDateTimeLocal}
        onCategoryChange={setCategory}
        onPriceOfferPenceChange={setPriceOfferPence}
        onPaymentMethodChange={setPaymentMethod}
        onContactMethodChange={setContactMethod}
        onSubmit={() => {
          if (!title.trim() || !description.trim()) {
            setError('Please add both a title and description.')
            return
          }
          setError(null)
        }}
        error={error}
      />
    </Box>
  )
}

const meta: Meta<typeof PostJobFormStory> = {
  title: 'UI/Forms/Post Job Form',
  component: PostJobFormStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof PostJobFormStory>

export const Default: Story = {}
