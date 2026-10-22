/**
 * 사용자 입력 및 로그에 포함될 수 있는 민감 정보(이메일, IP)를 마스킹합니다.
 */
export function maskSensitiveData(text: string): string {
  if (!text) return text;

  // IPv4 마스킹 (예: 192.168.1.100 -> 192.168.xxx.xxx 또는 [IP_MASKED])
  const ipRegex = /\b(\d{1,3}\.\d{1,3}\.)\d{1,3}\.\d{1,3}\b/g;
  let masked = text.replace(ipRegex, '$1***.***');

  // 이메일 마스킹 (예: admin@company.com -> a***n@company.com)
  const emailRegex = /\b([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\b/g;
  masked = masked.replace(emailRegex, (_match, user, domain) => {
    if (user.length <= 2) {
      return `${user[0]}*@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  });

  return masked;
}
