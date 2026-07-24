import { Container } from "../shared/components/Container";
import { useCv, CVHeader, CVSidebar, CVTabs } from "../features/cv";

export function CVPage() {
  const { data: cv, isLoading, isError } = useCv();

  return (
    <Container>
      <div className="py-10">
        {isLoading && (
          <p className="py-16 text-center text-text-secondary">
            Loading CV...
          </p>
        )}

        {!isLoading && (isError || !cv) && (
          <p className="py-16 text-center text-danger">
            Couldn't load the CV. Try refreshing the page.
          </p>
        )}

        {!isLoading && cv && (
          <div className="flex flex-col items-center gap-10 rounded-xl border border-border-default/50 bg-bg-surface/60 p-6 shadow-xl backdrop-blur-md">
            <CVHeader cv={cv} />
            <div className="flex w-full flex-col gap-10 md:flex-row">
              <CVSidebar cv={cv} />
              <CVTabs cv={cv} />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
