import type { SongMoodProgression } from '@/domain/entities/SongMoodProgression';

describe('SongMoodProgression Entity', () => {
  it('should create a valid mood progression object', () => {
    const progression: SongMoodProgression = {
      id: 1,
      songId: 1,
      section: '1',
      progression: '0(6小節) → +50(4小節)',
      sectionOrder: 1,
      isLocked: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(progression).toBeDefined();
    expect(progression.id).toBe(1);
    expect(progression.songId).toBe(1);
    expect(progression.section).toBe('1');
    expect(progression.sectionOrder).toBe(1);
  });

  it('should support fever section', () => {
    const feverProgression: SongMoodProgression = {
      id: 2,
      songId: 1,
      section: 'フィーバー',
      progression: '+50(8小節) → +25(8小節)',
      sectionOrder: 4,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(feverProgression.section).toBe('フィーバー');
    expect(feverProgression.sectionOrder).toBe(4);
  });

  it('should support complex progression patterns', () => {
    const complexProgression: SongMoodProgression = {
      id: 3,
      songId: 1,
      section: '4',
      progression: '-25(6小節) → +50(2小節) →0(4小節)',
      sectionOrder: 5,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(complexProgression.progression).toBe(
      '-25(6小節) → +50(2小節) →0(4小節)'
    );
  });

  it('should allow nullable fields', () => {
    const minimalProgression: SongMoodProgression = {
      id: 1,
      songId: 1,
      section: '1',
      progression: '0 → +50',
      sectionOrder: 1,
      isLocked: null,
      createdAt: null,
      updatedAt: null,
    };

    expect(minimalProgression).toBeDefined();
    expect(minimalProgression.isLocked).toBeNull();
  });

  it('should order progressions by sectionOrder', () => {
    const progressions: SongMoodProgression[] = [
      {
        id: 1,
        songId: 1,
        section: '1',
        progression: '0 → +50',
        sectionOrder: 1,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        songId: 1,
        section: '2',
        progression: '-25 → +25',
        sectionOrder: 2,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        songId: 1,
        section: '3',
        progression: '-25',
        sectionOrder: 3,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sorted = [...progressions].sort(
      (a, b) => a.sectionOrder - b.sectionOrder
    );

    expect(sorted[0]?.sectionOrder).toBe(1);
    expect(sorted[1]?.sectionOrder).toBe(2);
    expect(sorted[2]?.sectionOrder).toBe(3);
  });
});
