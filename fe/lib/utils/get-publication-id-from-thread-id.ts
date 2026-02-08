

export const getPublicationIdFromThreadId = (threadId: string) => {
  return threadId.split('-')[0]
}