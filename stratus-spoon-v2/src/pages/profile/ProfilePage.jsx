import { ProfileSummary } from '@/components/profile/ProfileSummary'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useProfile } from '@/hooks/useProfile'

export function ProfilePage() {
  const { data: profile } = useProfile()

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Profile"
          title="A calm account workspace"
          description="Profile, cookbook stats, and future preferences all live within the same visual system to keep the product cohesive."
        />
        {profile ? <ProfileSummary profile={profile} /> : null}
      </div>
    </PageSection>
  )
}
