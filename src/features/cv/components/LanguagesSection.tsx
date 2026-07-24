import type { LanguageDto } from "../../profile";

function LanguageRow({ language }: { language: LanguageDto }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text-primary">
        {language.languageName}
      </p>
      {language.isNative ? (
        <p className="text-xs text-text-secondary">(Native)</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-xs text-text-secondary">
          {language.readingLevel && (
            <span>
              Read: <span className="font-medium text-accent">{language.readingLevel}</span>
            </span>
          )}
          {language.writingLevel && (
            <span>
              Write: <span className="font-medium text-accent">{language.writingLevel}</span>
            </span>
          )}
          {language.speakingLevel && (
            <span>
              Speak: <span className="font-medium text-accent">{language.speakingLevel}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LanguagesSection({ languages }: { languages: LanguageDto[] }) {
  if (languages.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
        Languages
      </h2>
      <div className="space-y-3">
        {languages.map((language) => (
          <LanguageRow key={language.languageName} language={language} />
        ))}
      </div>
    </div>
  );
}
