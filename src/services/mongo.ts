import { ServicesError } from '@/exceptions';
import { MongoModel } from '@/models/mongo/emails';
import { logger } from '@/utils/logger';
import { normalizeString } from '@/utils/serializer';
import { Service } from 'typedi';

interface ReduceValues {
  char: string;
  charIdx: number[];
}

interface ReduceResult {
  firstNamePart?: boolean;
  firstNameEmail: ReduceValues;
  lastNameEmail: ReduceValues;
  error: boolean;
}

@Service()
export default class MongoServiceFile {
  private calcMatching(
    perfectFnMatch: boolean,
    perfectLnMatch: boolean,
    { firstName, fnDetected }: { firstName: string; fnDetected: string },
    { lastName, lnDetected }: { lastName: string; lnDetected: string },
  ) {
    //?/ score [+100]: orange(2); // score [-100]: red(1)
    if (perfectFnMatch && perfectLnMatch) {
      return { score: 200, color: 3 };
    }
    const matchingFn = Math.round(((fnDetected.length || 0) / firstName.length) * 100);
    const matchingLn = Math.round(((lnDetected.length || 0) / lastName.length) * 100);
    const bonusFn = perfectFnMatch ? 25 : 0;
    const bonusLn = perfectLnMatch ? 80 : 0;
    const score = Math.round((matchingFn + matchingLn) / 2 + (bonusFn + bonusLn));
    return { score, color: score >= 100 ? 2 : 1 };
  }

  private getSeparatedName(email: string, firstName: string, lastName: string) {
    const dotInMail = email.indexOf('.');

    const firstNameMap = new Map<string, number>();
    [...firstName].forEach((char, idx) => {
      if (!firstNameMap.has(char)) {
        firstNameMap.set(char, idx);
      }
    });

    const lastNameMap = new Map<string, number>();
    [...lastName].forEach((char, idx) => {
      if (!lastNameMap.has(char)) {
        lastNameMap.set(char, idx);
      }
    });

    const calcStartIdx = (lastCharIdx: number, currentNameIdx: number, { str, char }: { str: string; char: string }) => {
      if (lastCharIdx === currentNameIdx && currentNameIdx !== -1) {
        return currentNameIdx;
      }
      return str.indexOf(char, lastCharIdx);
    };

    const buildEmailParts = (firstPart: string, secondPart: string): { fnDetected: string; lnDetected: string } | undefined => {
      const firstNameCharIdx = [...firstPart].reduce((acc, char) => {
        const currentNameIdx = firstNameMap.get(char) ?? -1;
        const lastCharIdx = acc[acc.length - 1];

        return [...acc, firstName.indexOf(char, calcStartIdx(lastCharIdx, currentNameIdx, { str: firstName, char }))];
      }, [] as number[]);

      const lastNameCharIdx = [...secondPart].reduce((acc, char) => {
        const currentNameIdx = lastNameMap.get(char) ?? -1;
        const lastCharIdx = acc[acc.length - 1];

        return [...acc, lastName.indexOf(char, calcStartIdx(lastCharIdx, currentNameIdx, { str: lastName, char }))];
      }, [] as number[]);

      const hasInvalidChar = firstNameCharIdx.includes(-1) || lastNameCharIdx.includes(-1);

      const isAscending = (arr: number[]): boolean => {
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) {
            return false;
          }
        }
        return true;
      };

      const isFirstNameSorted = isAscending(firstNameCharIdx);
      const isLastNameSorted = isAscending(lastNameCharIdx);

      if (!hasInvalidChar && isFirstNameSorted && isLastNameSorted) {
        return {
          fnDetected: firstPart,
          lnDetected: secondPart,
        };
      }
      return undefined;
    };

    if (dotInMail !== -1) {
      const [part1, part2] = [email.slice(0, dotInMail), email.slice(dotInMail + 1)];
      if (part1.startsWith(firstName[0])) {
        return buildEmailParts(part1, part2);
      }

      if (part1.startsWith(lastName[0])) {
        return buildEmailParts(part2, part1);
      }

      return undefined;
    }

    const {
      firstNameEmail: { charIdx: FtCharIdx, char: firstNameToken },
      lastNameEmail: { charIdx: LtCharIdx, char: lastNameToken },
      error,
    }: ReduceResult = email.split('').reduce<ReduceResult>(
      (acc, char, idx) => {
        const firstNameIdx = firstNameMap.get(char) ?? -1;
        const lastNameIdx = lastNameMap.get(char) ?? -1;

        if (idx === 0 && (firstNameIdx === 0 || lastNameIdx === 0)) {
          const firstNamePart = firstNameIdx === 0;
          return {
            ...acc,
            firstNamePart,
            ...(firstNamePart
              ? {
                  firstNameEmail: { char, charIdx: [firstNameIdx] },
                }
              : { lastNameEmail: { char, charIdx: [lastNameIdx] } }),
          };
        }
        const { lastNameEmail, firstNameEmail, firstNamePart, error } = acc;

        if (firstNamePart === undefined || error) return acc;

        const getTargetProps = () => {
          const targetPart = firstNamePart ? firstNameEmail : lastNameEmail;
          const targetName = firstNamePart ? firstName : lastName;
          const currentNameIdx = firstNamePart ? firstNameIdx : lastNameIdx;
          const oppositeNameIdx = firstNamePart ? lastNameIdx : firstNameIdx;

          const lastCharIdx = targetPart.charIdx[targetPart.charIdx.length - 1];
          const actualCharIdx = targetName.indexOf(char, calcStartIdx(lastCharIdx, currentNameIdx, { str: targetName, char }));

          return {
            currentPartIdx: actualCharIdx,
            oppositePartIdx: oppositeNameIdx,
            targetPart,
          };
        };

        const targetPartName = firstNamePart ? 'firstNameEmail' : 'lastNameEmail';
        const oppositePartName = firstNamePart ? 'lastNameEmail' : 'firstNameEmail';

        const { currentPartIdx, oppositePartIdx, targetPart } = getTargetProps();
        const { charIdx, char: oldChar } = targetPart;

        if (currentPartIdx < charIdx[charIdx.length - 1]) {
          if (lastNameEmail.char && firstNameEmail.char)
            return {
              error: true,
              firstNamePart: undefined,
              firstNameEmail: { char: '', charIdx: [] },
              lastNameEmail: { char: '', charIdx: [] },
            };
          return {
            ...acc,
            firstNamePart: !firstNamePart,
            [oppositePartName]: {
              char: acc[oppositePartName].char + char,
              charIdx: [...acc[oppositePartName].charIdx, oppositePartIdx],
            },
          };
        }

        return {
          ...acc,
          [targetPartName]: {
            char: oldChar + char,
            charIdx: [...charIdx, currentPartIdx],
          },
        };
      },
      {
        firstNamePart: undefined,
        error: false,
        firstNameEmail: { char: '', charIdx: [] },
        lastNameEmail: { char: '', charIdx: [] },
      },
    );

    if (error) return undefined;
    if (FtCharIdx.includes(-1)) return undefined;
    if (LtCharIdx.includes(-1)) return undefined;
    return { fnDetected: firstNameToken, lnDetected: lastNameToken };
  }

  private generateSubstrings(str: string, minLength = 3) {
    const substrings = [];
    for (let i = 0; i <= str.length - minLength; i++) {
      substrings.push(str.slice(i, i + minLength));
    }
    return substrings;
  }

  private createRegex(firstName: string, lastName: string) {
    const firstNameSubstrings = this.generateSubstrings(firstName, Math.max(3, Math.floor(firstName.length / 2)));
    const lastNameSubstrings = this.generateSubstrings(lastName, Math.max(3, Math.floor(lastName.length / 2)));

    const allSubstrings = [...firstNameSubstrings, ...lastNameSubstrings].map(substr => substr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const regexPattern = `(${allSubstrings.join('|')})`;
    return new RegExp(regexPattern, 'i');
  }

  private detectPerfectNameMatch(name: string, value: string) {
    if (!value) {
      return false;
    }
    let i = 0;
    let j = 0;

    while (i < name.length && j < value.length) {
      if (name[i] === value[j]) {
        i++;
        j++;
      } else if (j > 0 && value[j] === value[j - 1]) {
        j++;
      } else {
        return false;
      }
    }
    while (j < value.length && value[j] === value[j - 1]) {
      j++;
    }
    return i === name.length && j === value.length;
  }

  public async personalData(searchFirstName: string, searchLastName: string) {
    try {
      const firstName = normalizeString(searchFirstName);
      const lastName = normalizeString(searchLastName);
      const user = await MongoModel.findOne(
        {
          firstName: firstName,
          lastName: lastName,
        },
        { email: 1, phone: 1 },
      ).collation({ locale: 'fr', strength: 1 });

      if (user) {
        const convertedEmail = normalizeString(user.email.replace(/\d+/g, ''));

        const values = this.getSeparatedName(convertedEmail, firstName, lastName);
        if (values) {
          const { fnDetected, lnDetected } = values;
          const perfectFnMatch = this.detectPerfectNameMatch(firstName, fnDetected);
          const perfectLnMatch = this.detectPerfectNameMatch(lastName, lnDetected);
          return { email: user.email, phone: user.phone, color: perfectFnMatch && perfectLnMatch ? 1 : 2 };
        }
      }
      const regex = this.createRegex(firstName, lastName);

      const users = await MongoModel.find(
        {
          email: { $regex: regex },
        },
        { email: 1, phone: 1 },
      ).collation({ locale: 'fr', strength: 1 });

      return users
        .reduce(
          (acc, user) => {
            if (!user.email) return acc;

            const { email, phone } = user;

            const emailAtIndex = email.indexOf('@');
            const emailLocalPart = emailAtIndex !== -1 ? email.slice(0, emailAtIndex) : email;

            const convertedEmail = normalizeString(emailLocalPart.replace(/\d+/g, ''));

            const values = this.getSeparatedName(convertedEmail, firstName, lastName);

            if (!values) {
              return acc;
            }

            const { fnDetected, lnDetected } = values;

            if (acc.haveTwoPart && !(fnDetected.length || lnDetected.length)) return acc;

            const perfectFnMatch = this.detectPerfectNameMatch(firstName, fnDetected);
            const perfectLnMatch = this.detectPerfectNameMatch(lastName, lnDetected);

            const { score, color } = this.calcMatching(perfectFnMatch, perfectLnMatch, { firstName, fnDetected }, { lastName, lnDetected });
            const currentMatch = { score, color, email, phone };

            const updatedTopMatches = [...acc.topMatches, currentMatch].sort((a, b) => b.score - a.score).slice(0, 2);

            const finalTopMatches =
              updatedTopMatches.length >= 2
                ? updatedTopMatches[0].color === updatedTopMatches[1].color
                  ? updatedTopMatches.slice(0, 2)
                  : [updatedTopMatches[0]]
                : updatedTopMatches;

            return {
              ...acc,
              ...(fnDetected && lnDetected ? { haveTwoPart: true } : {}),
              topMatches: finalTopMatches,
            };
          },
          {
            haveTwoPart: false,
            topMatches: [],
          },
        )
        .topMatches.map(v => ({ color: v.color, email: v.email, phone: v.phone }));
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }
}
